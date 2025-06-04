import React, { useContext } from 'react'
import { assets } from '../../assets/assets.js'
import {Link, useNavigate} from "react-router-dom"
import {useClerk, UserButton, useUser} from "@clerk/clerk-react"
import { AppContext } from '../../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'

const Navbar = () => {

  const isCourseListPage = location.pathname.includes('/course-list')

  const {openSignIn} = useClerk();
  const {user} = useUser();

  const navigate = useNavigate();
  const navigateToHome = () => {
    navigate("/")
  }

  const {isEducator, backendUrl, setIsEducator, getToken} = useContext(AppContext)

  const becomeEducator = async () => {
    try{
      if(isEducator){
        navigate('/educator')
        return
      }
      const token = await getToken()
      
      const {data} =  await axios.post(
        backendUrl + '/api/educator/update-role', 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      
      if(data.success){
        setIsEducator(true)
        toast.success(data.message)
      }else{
        toast.error(data.message)
      }
    }catch(err){
      toast.error(err.message)
    }
  }

  return (
    <div className={`flex items-centre justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? "bg-white" : 'bg-cyan-100/70'} `}>
        <img onClick={navigateToHome} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer'/>
        <div className='hidden md:flex items-centre gap-5 text-gray-500'>
          <div className='flex items-center gap-5'>
            {
              user && 
              <>
              <button onClick={becomeEducator}>{isEducator ? 
              "Educator Dashboard" : "Become Educator"}</button> | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            }
          </div>
          
          {
            user ? <UserButton/> : <button onClick={openSignIn} className='bg-blue-600 text-white px-5 py-2 rounded-full'>Create Account</button>
          }

        </div>

        {/* for phone screens */}
        <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
          <div className='flex items-center gap-5'>
            {
              user && 
              <>
              <button onClick={becomeEducator}>{isEducator ? 
              "Educator Dashboard" : "Become Educator"}</button> | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            }
          </div>

          {
            user ? <UserButton/> : <button onClick={openSignIn}><img src={assets.user_icon} alt="User" /></button>
          }

        </div>
    </div>
  )
}

export default Navbar