import { APP_NAME } from "../../config/constants"

export const Logo = () => {
  return (
    <div className='flex justify-center items-center'>
      <div className="mr-2 normal-case font-arcade">{APP_NAME}</div>
      <img src="/images/flip-flops-64_64.png" className='w-8 h-8' />
    </div>
  )
}