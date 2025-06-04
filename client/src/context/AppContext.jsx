import React, { useEffect, useState } from 'react'
import { dummyCourses } from '../assets/assets';
import {data, useNavigate} from "react-router-dom"
import humanizeDuration from 'humanize-duration';
import {useAuth, useUser} from '@clerk/clerk-react'
import axios from 'axios'
import {toast} from 'react-toastify'

export const AppContext = React.createContext();


export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const navigate = useNavigate();

    const currency = import.meta.env.VITE_CURRENCY

    const [allCourses, setAllCourses] = useState([])

    const [isEducator, setIsEducator] = useState(false)

    const [enrolledCourses, setEnrolledCourses] = useState([])

    const [userData, setUserData] = useState(null)


    const {getToken} = useAuth()
    const {user} = useUser()
    

    //fetch all courses
    const fetchAllCourses = async () => {
        try{
            const {data} =  await axios.get(backendUrl + '/api/course/all');
            
            if(data.success === 'true'){
                setAllCourses(data.courses)
            }else{
                toast.error(data.message)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    // fetch user data
    const fetchUserData = async () => {
        if(user.publicMetadata.role === 'educator'){
            setIsEducator(true);
        }

        try{
            const token = await getToken()
            const {data} =  await axios.get(backendUrl + '/api/user/data', {headers: {
                Authorization: `Bearer ${token}`
            }})
                        
            if(data.success){
                setUserData(data.data)
            }else{
                toast.error(data.message)
            }
            
        }catch(err){
            toast.error(err.message)
        }
    }

    //fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        try {
            const token = await getToken()
            
            const {data} = await axios.get(backendUrl + '/api/user/enrolled-courses', {headers: {Authorization: `Bearer ${token}`}})     

            if(data.success===true){
                const reversedCourses = data.enrolledCourses.reverse()
                setEnrolledCourses(reversedCourses)                
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    useEffect(()=>{
        fetchAllCourses()
    },[])

    //function to calculate average rating of course
    const calculateRating = (course) => {
        if(course.courseRatings.length === 0){
            return 0; //no rating
        }
        let totalRating = 0;
        course.courseRatings.forEach((rating)=>{
            totalRating += rating.rating;
        })
        return Math.floor(totalRating / course.courseRatings.length);
    }

    //function to calculate course chapter time
    const calculateChapterTime = (chapter) =>{
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        return humanizeDuration(time * 60 * 1000,{units: ["h","m"]})
    }

    //function to calculate course duration
    const calculateCourseDuration = (course) => {
        let time=0;
        course.courseContent.map((chapter) => (
            chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        ))
        return humanizeDuration(time * 60 * 1000,{units: ["h","m"]})
    }

    //function to calculate total number of available lectures in the course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if(Array.isArray(chapter.chapterContent)){
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }

    useEffect(()=>{
        if(user){
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    },[user])

    const value={
        userData,
        setUserData,
        getToken,
        currency, 
        allCourses, 
        fetchAllCourses,
        calculateRating,
        isEducator, setIsEducator,
        navigate,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        enrolledCourses, fetchUserEnrolledCourses,
        backendUrl
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}