import { FC } from "react"

type ToastBoxProps = {
    title: string
    url: string
    urlText: string
}
export const ToastBox:FC<ToastBoxProps> = ({title, url, urlText}) => {
    return (
    <div>
        {title}
        <br />
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
        >
            {urlText}
        </a>
    </div>
    )
}