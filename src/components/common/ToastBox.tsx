import { FC } from "react"
import { ToastBoxProps } from "../../types/types"

export const ToastBox: FC<ToastBoxProps> = ({ title, url, urlText }) => {
  return (
    <div className="">
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