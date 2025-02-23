import { FC } from "react";
import { RenderSocialIconsProps } from "../../types/types";
import { FaTwitter, FaDiscord, FaGithub, FaMedium, FaTelegram, FaGlobe } from 'react-icons/fa';

export const RenderSocialIcons: FC<RenderSocialIconsProps> = ({ metadata }) => {
  if (!metadata?.extensions) return null;

  const socialLinks = [
    { icon: FaTwitter, link: metadata.extensions.twitter },
    { icon: FaDiscord, link: metadata.extensions.discord },
    { icon: FaGithub, link: metadata.extensions.github },
    { icon: FaMedium, link: metadata.extensions.medium },
    { icon: FaTelegram, link: metadata.extensions.telegram },
    { icon: FaGlobe, link: metadata.extensions.website }
  ];

  return (
    <div className="flex gap-2">
      {socialLinks.map((social, index) => (
        social.link && (
          <a
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm w-8 h-8 p-0"
          >
            <social.icon />
          </a>
        )
      ))}
    </div>
  );
};
