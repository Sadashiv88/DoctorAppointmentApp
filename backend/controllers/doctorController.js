import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"



const changeAvailablity=async(req,res)=>{
    try{
        const{docId}=req.body
        const docData=await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available:!docData.available})
        res.json({success:true,message:"Availability changed"})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


const doctorList=async(req,res)=>{
    try{
        const doctors=await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API for doctor login
const loginDoctor=async(req,res)=>{
    try{
        const {email,password}=req.body
        const doctor=await doctorModel.findOne({email})

        if(!doctor){
            return res.json({success:false,message:'Invalid credentials'})
        }
        const isMatch=await bcrypt.compare(password,doctor.password)
        if(isMatch){
            const token=jwt.sign({id:doctor._id},process.env.JWT_SECRET)
            res.json({success:true,token})
            console.log(token)
        }   
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//Api to get doctor appointment for doctor panel
const appointmentDoctor=async(req,res)=>{
    try{
        const {docId}=req.body
        const appointments=await appointmentModel.find({docId})

        res.json({success:true,appointments})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to mark appointment completed for doctor panel
const appointmentComplete=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body
        const appointmentData=await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId===docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{isCompleted:true})
            return res.json({success:true,message:'Appointment Completed'})

        }else{
            return res.json({success:false,message:'Mark Failed'})

        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to cancel appointment for doctor panel
const appointmentCancel=async(req,res)=>{
    try{
        const {docId,appointmentId}=req.body
        const appointmentData=await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId===docId){
            await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
            return res.json({success:true,message:'Appointment Cancelled'})

        }else{
            return res.json({success:false,message:'Cancellation Failed'})
            
        }

    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//api to get dashboard data for doctor panel
const doctorDashboard=async(req,res)=>{
    try{
        const{docId}=req.body
        const appointments=await appointmentModel.find({docId})
        let earning=0
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earning+=item.amount
            }
        })
        let patients=[]
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })

        const dashData={
            earning,
            appointments:appointments.length,
            patients:patients.length,
            latestAppointments:appointments.reverse().slice(0,5)
        }

        res.json({success:true,dashData})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to get doctor profile for Doctor Panel
const doctorProfile=async(req,res)=>{
    try{
        const {docId}=req.body
        const profileData=await doctorModel.findById(docId).select('-password')
        res.json({success:true,profileData})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//API to update doctor profile data from Doctor Panel
const updateDoctorProfile=async(req,res)=>{
    try{
        const {docId,fees,address,available}=req.body
        await doctorModel.findByIdAndUpdate(docId,{fees,address,available})

        res.json({success:false,message:'Profile Updated'})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {changeAvailablity,
    doctorList,loginDoctor
    ,appointmentDoctor,
    appointmentCancel,
    appointmentComplete,
    doctorDashboard,doctorProfile,
    updateDoctorProfile
}