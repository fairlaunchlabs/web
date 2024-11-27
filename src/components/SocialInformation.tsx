import React from 'react';

interface SocialInformationProps {
    description: string;
    website: string;
    twitter: string;
    discord: string;
    telegram: string;
    github: string;
    medium: string;
    onDescriptionChange: (value: string) => void;
    onWebsiteChange: (value: string) => void;
    onTwitterChange: (value: string) => void;
    onDiscordChange: (value: string) => void;
    onTelegramChange: (value: string) => void;
    onGithubChange: (value: string) => void;
    onMediumChange: (value: string) => void;
}

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
        <div className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                />
            </div>
            <div>
                <label htmlFor="website" className="block text-sm font-medium mb-1">
                    Website
                </label>
                <input
                    type="url"
                    id="website"
                    value={website}
                    onChange={(e) => onWebsiteChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                />
            </div>
            <div>
                <label htmlFor="twitter" className="block text-sm font-medium mb-1">
                    Twitter
                </label>
                <input
                    type="text"
                    id="twitter"
                    value={twitter}
                    onChange={(e) => onTwitterChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="@username"
                />
            </div>
            <div>
                <label htmlFor="discord" className="block text-sm font-medium mb-1">
                    Discord
                </label>
                <input
                    type="text"
                    id="discord"
                    value={discord}
                    onChange={(e) => onDiscordChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Discord server invite link"
                />
            </div>
            <div>
                <label htmlFor="telegram" className="block text-sm font-medium mb-1">
                    Telegram
                </label>
                <input
                    type="text"
                    id="telegram"
                    value={telegram}
                    onChange={(e) => onTelegramChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Telegram group link"
                />
            </div>
            <div>
                <label htmlFor="github" className="block text-sm font-medium mb-1">
                    GitHub
                </label>
                <input
                    type="text"
                    id="github"
                    value={github}
                    onChange={(e) => onGithubChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="GitHub profile or repository"
                />
            </div>
            <div>
                <label htmlFor="medium" className="block text-sm font-medium mb-1">
                    Medium
                </label>
                <input
                    type="text"
                    id="medium"
                    value={medium}
                    onChange={(e) => onMediumChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Medium profile or publication"
                />
            </div>
        </div>
    );
};
