import { FC, useEffect, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { useParams } from "react-router-dom";
import { InitiazlizedTokenData, OrderedUser, Role } from "../types/types";
import { DEFAULT_IMAGE } from "../config/constants";
import { AddressDisplay } from "../components/common/AddressDisplay";
import { socialIcons } from "../components/social/MyProfile";
import { generateDefaultUsername } from "../utils/format";
import { getSearchByKey} from "../utils/user";
import { useAuth, useDeviceType } from "../utils/contexts";
import { mergeUserData } from "./SocialExplore";
import { CommentBox } from "../components/social/CommentBox";
import { useLazyQuery } from "@apollo/client";
import { queryInitializeTokenEventByMints, queryMyDelegatedTokens, queryMyDeployments, querySetRefererCodeEntitiesByOwner } from "../utils/graphql";
import { TokenCardSimple } from "../components/mintTokens/TokenCardSimple";
import { TokenCardMobile } from "../components/mintTokens/TokenCardMobile";
import { SocialButtonsUser } from "../components/social/SocialButtonsUser";
import { FaAngleDoubleDown } from "react-icons/fa";
import toast from "react-hot-toast";

type SocialUserDetailsProps = {
  expanded: boolean;
};

const titles = {
  "issuer": "Launched Tokens List",
  "promoter": "Promoting Tokens List",
  "manager": "Managing Tokens List",
}

export const SocialUserDetails: FC<SocialUserDetailsProps> = ({ expanded }) => {
  const [user, setUser] = useState<OrderedUser | null>(null);
  const { token, walletAddress } = useAuth();
  const { address } = useParams();
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const { isMobile } = useDeviceType();
  const [tokensByAdmin, setTokensByAdmin] = useState<InitiazlizedTokenData[]>([]);
  const [tokensByValueManager, setTokensByValueManager] = useState<InitiazlizedTokenData[]>([]);
  const [tokensByPromoter, setTokensByPromoter] = useState<InitiazlizedTokenData[]>([]);

  const [searchTokensByAdmin, { loading: searchLoadingByAdmin, error: searchErrorByAdmin, data: searchDataByAdmin }] = useLazyQuery(queryMyDeployments);

  const [searchTokensByValueManager, { loading: searchLoadingByValueManager, error: searchErrorByValueManager, data: searchDataByValueManager }] = useLazyQuery(queryMyDelegatedTokens);

  const [searchTokensByPromoter, { loading: searchLoadingByPromoter, error: searchErrorByPromoter, data: searchDataByPromoter }] = useLazyQuery(querySetRefererCodeEntitiesByOwner);

  const [searchTokensByMints, { loading: searchLoadingByMints, error: searchErrorByMints, data: searchDataByMints }] = useLazyQuery(queryInitializeTokenEventByMints);

  const fetchUserData = async () => {
    const result = await getSearchByKey(token as string, address as string);
    if (!result.success) {
      toast.error(result.message as string);
      return;
    }
    const users = mergeUserData(result.data as OrderedUser[]);
    setUser(users[0] as OrderedUser);
  }

  const fetchTokens = async () => {
    // Fetch tokens
    (user?.role as Role[]).forEach((role) => {
      if (role === Role.ISSUER && tokensByAdmin.length === 0) searchTokensByAdmin({
          fetchPolicy: 'network-only',
          variables: {
            wallet: user?.admin,
            skip: 0,
            first: 100,
          },
        });
      else if (role === Role.PROMOTER && tokensByPromoter.length === 0) searchTokensByPromoter({
          fetchPolicy: 'network-only',
          variables: {
            owner: user?.admin,
            skip: 0,
            first: 100,
          },
        });
      else if (role === Role.MANAGER && tokensByValueManager.length === 0) searchTokensByValueManager({
          fetchPolicy: 'network-only',
          variables: {
            wallet: user?.admin,
            skip: 0,
            first: 100,
          },
        });
      }
    );
  };

  useEffect(() => {
    if (!searchLoadingByAdmin && !searchErrorByAdmin && searchDataByAdmin) {
      setTokensByAdmin(searchDataByAdmin.initializeTokenEventEntities as InitiazlizedTokenData[])
    }
  }, [searchLoadingByAdmin, searchErrorByAdmin, searchDataByAdmin]);

  useEffect(() => {
    if (!searchLoadingByValueManager && !searchErrorByValueManager && searchDataByValueManager) {
      setTokensByValueManager(searchDataByValueManager.initializeTokenEventEntities as InitiazlizedTokenData[])
    }
  }, [searchLoadingByValueManager, searchErrorByValueManager, searchDataByValueManager]);

  useEffect(() => {
    if (!searchLoadingByPromoter && !searchErrorByPromoter && searchDataByPromoter) {
      const mints = [];
      for (let i = 0; i < searchDataByPromoter.setRefererCodeEventEntities.length; i++) {
        mints.push(searchDataByPromoter.setRefererCodeEventEntities[i].mint);
      }
      searchTokensByMints({
        fetchPolicy: 'network-only',
        variables: {
          mints: mints,
          orderBy: "timestamp",
        },
      });
    }
  }, [searchLoadingByPromoter, searchErrorByPromoter, searchDataByPromoter]);

  useEffect(() => {
    if (!searchLoadingByMints && !searchErrorByMints && searchDataByMints) {
      setTokensByPromoter(searchDataByMints.initializeTokenEventEntities as InitiazlizedTokenData[])
    }
  }, [searchLoadingByMints, searchErrorByMints, searchDataByMints]);

  useEffect(() => {
    if (address && token) fetchUserData();
  }, [address, token]);

  useEffect(() => {
    if (user) fetchTokens();
  }, [user])

  if (!user) {
    return (
      <div className={`space-y-3 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
        <PageHeader title="User Details" bgImage="/bg/group1/22.jpg" />
        <p className="text-gray-400">User not found. Please go back.</p>
      </div>
    );
  }

  const roles = Array.isArray(user.role) ? user.role : [user.role];
  const tokenCounts = Array.isArray(user.tokenCount) ? user.tokenCount : [user.tokenCount];
  const socialLinks = user.socialLinks ? user.socialLinks : {};

  const handleCopy = () => {
    navigator.clipboard.writeText(token as string);
  };

  return (
    <div className={`space-y-4 md:p-4 md:mb-20 ${expanded ? 'md:ml-64' : 'md:ml-20'}`}>
      {/* <button
        onClick={handleCopy}
        className="btn-ghost p-2"
        title="Copy Address"
      >
        Copy token
      </button> */}

      <div
        className="pixel-box flex flex-col items-center space-y-3"
        style={{
          backgroundImage: `url(${user.avatar || DEFAULT_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0 bg-white/60 backdrop-filter backdrop-blur-md"
          style={{ zIndex: 0 }}
        ></div>

        <div className="relative flex flex-col items-center space-y-3">
          <img
            src={user.avatar || DEFAULT_IMAGE}
            alt={user.username || 'User'}
            className="pixel-avatar-round w-32 h-32"
          />
          <div className="text-center">
            <h2 className="text-xl font-bold">{user.username || generateDefaultUsername(user.admin)}</h2>
            <div className="flex justify-center">
              <AddressDisplay address={user.admin} />
            </div>
            {user.bio && <p className="text-sm mt-1 p-3">{user.bio}</p>}
          </div>

          <SocialButtonsUser 
            user={user} 
            token={token} 
            isCommentOpen={false} 
            setIsCommentOpen={setIsCommentOpen} 
            fetchUserData={fetchUserData}
          />

          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <div className="flex justify-center gap-3">
              {Object.entries(socialLinks).map(([key, value]) => (
                <div key={key} className='flex items-center space-x-5'>
                  <a href={value as unknown as string} target='_blank' rel="noopener noreferrer" className="hover:underline">
                    <div>{socialIcons[key as keyof typeof socialIcons]}</div>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Role and Token */}
      <div className="space-y-2">
        {roles.map((role, index) => (
          <div key={index} className="">
            <div className="flex font-semibold mb-2 ml-2">
              <div>{titles[role]}</div>
              <FaAngleDoubleDown className="mt-1 ml-1"/>
            </div>
            {tokensByAdmin.length > 0 && role === Role.ISSUER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByAdmin.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={token} number={index + 1} type="static" />
                  )}
                </div> 
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByAdmin.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardMobile key={index} token={token} number={index + 1} type="static" />
                  )}
                </div>
              ))}

              {tokensByValueManager.length > 0 && role === Role.MANAGER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByValueManager.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={token} number={index + 1} type="static" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByValueManager.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardMobile key={index} token={token} number={index + 1} type="static" />
                  )}
                </div>
              ))}

              {tokensByPromoter.length > 0 && role === Role.PROMOTER && 
              (isMobile ? (
                <div className="grid grid-cols-2 gap-4 p-1">
                  {tokensByPromoter.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardSimple key={index} token={token} number={index + 1} type="static" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 p-1">
                  {tokensByPromoter.map((token: InitiazlizedTokenData, index: number) =>
                    <TokenCardMobile key={index} token={token} number={index + 1} type="static" />
                  )}
                </div>
              ))}

          </div>
        ))}
      </div>

      {/* Comments */}
      {isCommentOpen && 
        <div className="">
          <CommentBox 
            setIsOpen={(bl) => setIsCommentOpen(bl)} 
            token={token as string} 
            orderedData={user as OrderedUser}
            type={'user'}
            expanded={expanded}
          />
        </div>}
    </div>
  );
};