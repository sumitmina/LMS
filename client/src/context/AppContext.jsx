import React, { useEffect, useState } from 'react'
import { dummyCourses } from '../assets/assets';
import {useNavigate} from "react-router-dom"
import humanizeDuration from 'humanize-duration';
import {useAuth, useUser} from '@clerk/clerk-react'

export const AppContext = React.createContext();


export const AppContextProvider = (props) => {

    const navigate = useNavigate();

    const currency = import.meta.env.VITE_CURRENCY

    const [allCourses, setAllCourses] = useState([])

    const [isEducator, setIsEducator] = useState(true)

    const [enrolledCourses, setEnrolledCourses] = useState([])

    const {getToken} = useAuth()
    const {user} = useUser()

    const logToken = async () => {
        console.log(await getToken());
        
    }

    useEffect(()=>{
        if(user){
            logToken();
        }
    },[user])


    //fetch all courses
    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses)
    }

    //fetch user enrolled courses
    const fetchUserEnrolledCourses = async () => {
        setEnrolledCourses(dummyCourses)
    }


    useEffect(()=>{
        fetchAllCourses()
        fetchUserEnrolledCourses()
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
        return totalRating / course.courseRatings.length;
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

    const value={
        currency, 
        allCourses, 
        calculateRating,
        isEducator, setIsEducator,
        navigate,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        enrolledCourses, fetchUserEnrolledCourses
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}