import React from 'react';
import { SocialInformationProps } from '../../types/types';

export const SocialInformation: React.FC<SocialInformationProps> = ({
  description,
  website,
  twitter,
  discord,
  telegram,
  github,
  medium,
  onDescriptionChange,
  onWebsiteChange,
  onTwitterChange,
  onDiscordChange,
  onTelegramChange,
  onGithubChange,
  onMediumChange,
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <label htmlFor="description" className="text-label mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${description ? 'border-base-content' : ''}`}
          className='pixel-textarea w-full'
          placeholder='Describe your development'
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="website" className="text-label mb-1">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${website ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="https://example.com"
        />
      </div>
      <div>
        <label htmlFor="twitter" className="text-label mb-1">
          Twitter
        </label>
        <input
          type="text"
          id="twitter"
          value={twitter}
          onChange={(e) => onTwitterChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${twitter ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="@username"
        />
      </div>
      <div>
        <label htmlFor="discord" className="text-label mb-1">
          Discord
        </label>
        <input
          type="text"
          id="discord"
          value={discord}
          onChange={(e) => onDiscordChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${discord ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Discord server invite link"
        />
      </div>
      <div>
        <label htmlFor="telegram" className="text-label mb-1">
          Telegram
        </label>
        <input
          type="text"
          id="telegram"
          value={telegram}
          onChange={(e) => onTelegramChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${telegram ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Telegram group link"
        />
      </div>
      <div>
        <label htmlFor="github" className="text-label mb-1">
          GitHub
        </label>
        <input
          type="text"
          id="github"
          value={github}
          onChange={(e) => onGithubChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${github ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="GitHub profile or repository"
        />
      </div>
      <div>
        <label htmlFor="medium" className="text-label mb-1">
          Medium
        </label>
        <input
          type="text"
          id="medium"
          value={medium}
          onChange={(e) => onMediumChange(e.target.value)}
          // className={`w-full px-3 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors focus:outline-none focus:border-primary focus:border-2 bg-base-100 ${medium ? 'border-base-content' : ''}`}
          className='input w-full'
          placeholder="Medium profile or publication"
        />
      </div>
    </div>
  );
};
