// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { type } = require('os');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;

const https = require('https');





// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/iambob', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error(err);
  });

// Student model
const Students = mongoose.model('Students', {
  name: {
    type: String,
    required: true
  },
  enrolmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  }
});

// STudent_Subjects model
const Student_Subject = mongoose.model('Student_Subjects', {
    student: {
      type: String, // Change type to String
      ref: 'Students', // Update reference to enrolmentNumber
    },
    subject: {
        type: String,
        ref: 'Subjects',
    },
    grade: String,
    attendance: [{
      date: Date,
      present: Boolean
    }]
  });

// Subject model
const Subjects = mongoose.model('Subjects', {
    title: {
      type: String,
      required: true
    },
    subjectId: {
      type: String,
      required: true,
      unique: true
    },
    courseIncharge: {
      type: String,
      required: true
    }
  });


// Middleware
app.use(express.json());
app.use(cors());
// Routes
// Routes for Students

// Get all students
app.get('/api/students', async (req, res) => {
    try {
      const students = await Students.find();
      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

    // Get a student by enrolment number
    app.post('/enrolstudents', async (req, res) => {
      try {
        const enrolmentNumber = req.query.query; // Assuming enrolmentNumber is the query parameter
        console.log("Query: ", req.query.query);
        
        const student = await Students.findOne({ enrolmentNumber: enrolmentNumber });
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
    
        console.log("Student Details: \n", student);
    
        const studentSubjects = await Student_Subject.find({ student: student._id }).populate('subject').exec();
        console.log("Grades:\n", studentSubjects);
    
        // const subjectsData = studentSubjects.map(subject => ({
        //   subjectTitle: subject.subject.title,
        //   subjectId: subject.subject.subjectId,
        //   grade: subject.grade,
        //   attendance: subject.attendance    
        // }));
    
        const responseData = {
          name: student.name,
          enrolmentNumber: student.enrolmentNumber,
          email: student.email,
          subjects: studentSubjects
        };
    
        res.json(responseData);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    
          // const student = Students.findOne({ enrolmentNumber: req.body.enrol }).then((student) => {
      //   if (!student) {
      //       return res.status(404).json({ message: "Student not found" });
      //     }

      //   console.log( student);
      //   res.json(student);
      // })
  //   .catch((error) => {
  //   });
  // });


//   app.post('/enrolstudents', (req, res) => {
//     console.log(req.body, 111)
//     const student = Students.findOne({ enrolmentNumber: req.body.enrol }).then((student) => {
//       if (!student) {
//           return res.status(404).json({ message: "Student not found" });
//         }
//         const subjectsWithGrades =  Student_Subject.aggregate([
//           {
//             $match: { student: student.enrolmentNumber }
//           },
//           {
//             $lookup: {
//               from: "Subjects",
//               localField: "subject",
//               foreignField: "subjectId",
//               as: "subjectInfo"
//             }
//           },
//           {
//             $project: {
//               _id: 0,
//               subject: "$subjectInfo.title",
//               grade: 1
//             }
//           }
//         ]);
//          // Combine student information with subjects and grades
//     const studentWithSubjectsAndGrades = {
//       _id: student._id,
//       name: student.name,
//       enrolmentNumber: student.enrolmentNumber,
//       email: student.email,
//       subjects: subjectsWithGrades
//     };

//     res.json(studentWithSubjectsAndGrades);
  
//       console.log( student);
//       res.json(student);
//     })
//   .catch((error) => {
//   });
// });





    // TESTING STUDENT DASHBOARD
    // Route for student dashboard
// app.get('/student-dashboard/:enrolmentNumber', async (req, res) => {
//   try {
//     const { enrolmentNumber } = req.params;

//     // Find the student by enrolment number
//     const student = await Students.findOne({ enrolmentNumber });
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Find all subjects and associated grades for the student
//     const subjectsWithGrades = await Student_Subject.aggregate([
//       {
//         $match: { student: student.enrolmentNumber }
//       },
//       {
//         $lookup: {
//           from: "Subjects",
//           localField: "subject",
//           foreignField: "subjectId",
//           as: "subjectInfo"
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           subject: "$subjectInfo.title",
//           grade: 1
//         }
//       }
//     ]);

//     // Combine student information with subjects and grades
//     const studentWithSubjectsAndGrades = {
//       _id: student._id,
//       name: student.name,
//       enrolmentNumber: student.enrolmentNumber,
//       email: student.email,
//       subjects: subjectsWithGrades
//     };

//     res.json(studentWithSubjectsAndGrades);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


  
  // Create a new student
  app.post('/api/students', async (req, res) => {
    try {
      const { name, enrolmentNumber, email } = req.body;
      const student = await Students.create({ name, enrolmentNumber, email });
      res.status(201).json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete a student
  app.delete('/api/students/:enrolmentNumber', async (req, res) => {
    try {
      const { enrolmentNumber } = req.params;
      const student = await Students.findOneAndDelete({ enrolmentNumber });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      // Also delete all student-subject mappings associated with the deleted student
      await Student_Subject.deleteMany({ student: enrolmentNumber });
      res.json({ message: "Student and associated subjects deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Update a student
  app.put('/api/students/:enrolmentNumber', async (req, res) => {
    try {
      const { enrolmentNumber } = req.params;
      const { name, email } = req.body;
      
      const updatedStudent = await Students.findOneAndUpdate(
        { enrolmentNumber },
        { name, email },
        { new: true }
      );
      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }
    
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Routes for Subjects
  
  // Get all subjects
  app.get('/api/subjects', async (req, res) => {
    try {
      const subjects = await Subjects.find();
      res.json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a subject by subjectId
app.get('/api/subjects/:subjectId', async (req, res) => {
    try {
      const { subjectId } = req.params;
      const subject = await Subjects.findOne({subjectId});
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.json(subject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  
  // Create a new subject
  app.post('/api/subjects', async (req, res) => {
    try {
      const { title, subjectId, courseIncharge } = req.body;
      const subject = await Subjects.create({ title, subjectId, courseIncharge });
      res.status(201).json(subject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Delete a subject
  // app.delete('/api/subjects/:subjectId', async (req, res) => {
  //   try {
  //     const { subjectId } = req.params;
  //     const subject = await Subjects.findOneAndDelete(subjectId);
  //     if (!subject) {
  //       return res.status(404).json({ message: "Subject not found" });
  //     }
  //     await Student_Subject.deleteMany({ subject: subjectId });
  //     res.json({ message: "Subject deleted successfully" });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // });
  // Delete a subject
app.delete('/api/subjects/:subjectId', async (req, res) => {
  try {
    const subjectId = req.params.subjectId; // Extract subjectId directly
    const subject = await Subjects.findByIdAndDelete(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    await Student_Subject.deleteMany({ subject: subjectId });
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

  
  // Update a subject
 // Update a subject
// app.put('/api/subjects/:subjectId', async (req, res) => {
//     try {
//       const { subjectId } = req.params;
//       const { title, courseIncharge } = req.body;
      
//       const updatedSubject = await Subjects.findOneAndUpdate(
//         { subjectId: subjectId },
//         { title, courseIncharge },
//         { new: true }
//       );
      
//       if (!updatedSubject) {
//         return res.status(404).json({ message: "Subject not found" });
//       }
      
//       res.json(updatedSubject);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
app.put('/api/subjects/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { title, courseIncharge } = req.body;
    
    const updatedSubject = await Subjects.findOneAndUpdate(
      { _id: subjectId },
      { title, courseIncharge },
      { new: true }
    );
    
    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    
    res.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a subject


  // Routes for Student_Subjects
  //Add a subject to a student
    // app.post('/api/student-subjects', async (req, res) => {
    //     try {
    //     const { student, subject, grade } = req.body;
    //     const student_subject = await Student_Subject.create({ student, subject, grade });
    //     res.status(201).json(student_subject);
    //     } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Internal server error" });
    //     }
    // });
    app.post('/api/student-subjects', async (req, res) => {
      try {
        const { student, subject, grade } = req.body;
    
        // Check if the student is already added to the subject
        const existingEntry = await Student_Subject.findOne({ student, subject });
    
        if (existingEntry) {
          return res.status(400).json({ message: "Student is already added to this subject" });
        }
    
        // If not exists, create a new entry
        const student_subject = await Student_Subject.create({ student, subject, grade });
        res.status(201).json(student_subject);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    });




    //Add attendance to all students in a subject
    // app.post('/api/student-subjects/attendance/:subjectId', async (req, res) => {
    //     try {
    //     const { subjectId } = req.params;
    //     const { date, present } = req.body;
    //     const students = await Student_Subject.find({ subject: subjectId });
    //     const attendance = students.map(async (student) => {
    //         await Student_Subject.updateOne(
    //         { _id: student._id },
    //         { $push: { attendance: { date, present } } }
    //         );
    //     });
    //     await Promise.all(attendance);
    //     res.json({ message: "Attendance added successfully" });
    //     } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: "Internal server error" });
    //     }
    // });
  //   app.post('/api/student-subjects/attendance/:subjectId', async (req, res) => {
  //     try {
  //         const { subjectId } = req.params;
  //         const { date, present } = req.body;
  
  //         // Check if the subject exists
  //         const subject = await Subjects.findById(subjectId);
  //         if (!subject) {
  //             return res.status(404).json({ message: "Subject not found" });
  //         }
  
  //         // Get all students enrolled in the subject
  //         const students = await Student_Subject.find({ subject: subjectId });
  
  //         // Update attendance for each student
  //         const attendancePromises = students.map(async (student) => {
  //             await Student_Subject.findByIdAndUpdate(student._id, {
  //                 $push: { attendance: { date, present } }
  //             });
  //         });
  
  //         // Wait for all updates to complete
  //         await Promise.all(attendancePromises);
  
  //         // Respond with success message
  //         res.json({ message: "Attendance added successfully" });
  //     } catch (error) {
  //         console.error(error);
  //         res.status(500).json({ message: "Internal server error" });
  //     }
  // });
  // Add Attendance
  app.post('/api/student-subjects/attendance/:studentId/:subjectId', async (req, res) => {
    try {
      const { studentId, subjectId } = req.params;
      const { date, present } = req.body;
  
      // Check if the student and subject exist
      const student = await Students.findById(studentId);
      const subject = await Subjects.findById(subjectId);
      if (!student || !subject) {
        return res.status(404).json({ message: "Student or Subject not found" });
      }
  
      // Find the student-subject record
      let studentSubject = await Student_Subject.findOne({ student: studentId, subject: subjectId });
  
      // If student-subject record doesn't exist, create one
      if (!studentSubject) {
        studentSubject = new Student_Subject({
          student: studentId,
          subject: subjectId,
          attendance: [{ date, present }]
        });
      } else {
        // Otherwise, update the attendance
        studentSubject.attendance.push({ date, present });
      }
  
      // Save the updated/created student-subject record
      await studentSubject.save();
  
      res.json({ message: "Attendance added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Update Attendance (if needed)
app.put('/api/student-subjects/attendance/:studentSubjectId', async (req, res) => {
  try {
      const { studentSubjectId } = req.params;
      const { date, present } = req.body;

      // Update the attendance record
      await Student_Subject.findByIdAndUpdate(studentSubjectId, {
          $push: { attendance: { date, present } }
      });

      res.json({ message: "Attendance updated successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
});

// Delete Attendance (if needed)
app.delete('/api/student-subjects/attendance/:studentSubjectId/:attendanceId', async (req, res) => {
  try {
      const { studentSubjectId, attendanceId } = req.params;

      // Remove the attendance entry
      await Student_Subject.findByIdAndUpdate(studentSubjectId, {
          $pull: { attendance: { _id: attendanceId } }
      });

      res.json({ message: "Attendance deleted successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
  }
});

  
  //Add grade to all students in a subject
    app.put('/api/student-subjects/grade/:subjectId', async (req, res) => {
        try {
        const { subjectId } = req.params;
        const { grade } = req.body;
        const students = await Student_Subject.find({ subject: subjectId });
        const grades = students.map(async (student) => {
            await Student_Subject.updateOne(
            { _id: student._id },
            { grade }
            );
        });
        await Promise.all(grades);
        res.json({ message: "Grade added successfully" });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
        }
    });
app.get("/auth/google",(req,res)=>{
  const config = {
    clientID:"517167247551-0ijf7dc2v773bk63dk1kea9ii1jobind.apps.googleusercontent.com",
    redirectURI: 'http://localhost:5000/auth/google/callback',
    scope: 'email',
    response_type: 'code'
  }
  console.log(config);
  // const idToken = config.data.id_token;
  // console.log(idToken)
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientID}&redirect_uri=${config.redirectURI}&scope=${config.scope}&response_type=${config.response_type}`)
})

// app.get("/auth/google", async (req, res) => {
//   try {
//     // Extract authorization code from the query parameters
//     const code = req.query.code;

//     // Make a POST request to exchange the authorization code for an access token and ID token
//     const response = await axios.post('https://oauth2.googleapis.com/token', qs.stringify({
//       code: code,
//       client_id: "517167247551-0ijf7dc2v773bk63dk1kea9ii1jobind.apps.googleusercontent.com",
//       // client_secret: "<your_client_secret>",
//       redirect_uri: 'http://localhost:5000/auth/google',
//       grant_type: 'authorization_code'
//     }), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     // Extract the ID token from the response
//     const idToken = response.data.id_token;
//     console.log(idToken)

//     // You can decode the ID token if needed to extract user information
//     // For example, using libraries like jsonwebtoken

//     // Respond with the ID token
//     res.send(idToken);
//   } catch (error) {
//     console.error('Error handling Google callback:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.get("/auth/google/callback",(req,res)=>{
  const secretKey = 'secretKey';

  // Set the payload and options for the JWT token
  const payload = {
    code: 'authorized'
  };

  const options = {
    expiresIn: '1h' // Token expiration time
  };

  // Create the JWT token
  const token = jwt.sign(payload, secretKey, options);

  // Send the token as response
  // res.send(token);
  res.cookie('token', token);
  res.redirect("http://localhost:3000/AdminDashboard");
  // res.send(`<script>window.localStorage.setItem("token", "asdasdsd"); window.location.href = "http://localhost:3000/AdminDashboard";</script>`);
  // res.redirect("http://localhost/:3000/AdminDashboard")
})






  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });