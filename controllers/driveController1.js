const express = require("express");
const router = express.Router();
const z = require("zod");
const { Drive } = require("../modals/driveModal.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../middlewares/index");
const User = require("../modals/userModal.js")



const signupBody = z.object({ 
  username: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string(),
  teamName: z.string().min(1),
  position: z.string().min(1),
  password: z.string().min(6),
}); 

router.post("/signup", async (req, res) => {
  try {
    // Input validation check
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Input specified in incorrect format",
      });
    }
    
    // Existing user check when we allo a signle user to work with multiple companies
    const existingUser = await User.findOne({ username: req.body.username});
    if (existingUser) {
      return res.status(409).json({
        message: "Existing user",
      });
    }

    // const hashedpassword = await bcrypt.hash(req.body.password, 10);

    // When both checks are successful, add user to the database
    const user = await User.create({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      phoneNumber:req.body.phoneNumber,
      linkedinId:req.body.linkedinId,
      teamName:req.body.teamName,
      position:req.body.position,
    });

    const userId = user._id;
    const token = jwt.sign(
      {
        userId,
      }, 
      JWT_SECRET
    );

    // console.log(jwt.decode(token))

    res.status(201).json({
      message: "User created successfully",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        companyName:user.companyName,
        position:user.position
      },
    }); 
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const signinBody = z.object({
  username: z.string().email(),
  password: z.string().min(1),
});

router.post("/signin", async (req, res) => {
  const { success } = signinBody.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      message: "Input specified in incorrect format",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
  });
  

  if (!user) {
    return res.status(401).json({
      message: "Not a registered user",
    });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    // console.log(jwt.decode(token))
    return res.status(200).json({
      message: "Welcome user, you are logged in",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        teamName:user.teamName,
        position:user.position
      },
    });
  }

  res.status(401).json({
    message: "Password incorrect",
  });
});

router.post('/drives',authMiddleware, async (req, res) => {
  try {
    const newDrive = new Drive(req.body);
    const savedDrive = await newDrive.save();
    res.status(201).json(savedDrive);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/drives',authMiddleware, async (req, res) => {
  try {
    const {
      companyName,
      hrDetails,
      coodName,
      phoneNumber,
      status,
      dateCreated,
      dateUpdated,
      totalParticipated,
      totalPlaced,
    } = req.query;

    // Build a filter object
    const filter = {};

    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' }; // Case-insensitive search
    }
    if (hrDetails) {
      filter.hrDetails = { $elemMatch: { $regex: hrDetails, $options: 'i' } }; // Adjust according to the structure of hrDetails
    }
    if (coodName) {
      filter.coodName = { $regex: coodName, $options: 'i' };
    }
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    if (status) {
      filter.status = status; // Direct match, no regex
    }
    if (dateCreated) {
      filter.dateCreated = dateCreated; // Direct match
    }
    if (dateUpdated) {
      filter.dateUpdated = dateUpdated; // Direct match
    }
    if (totalParticipated) {
      filter.driveClosingDetails = { $elemMatch: { totalParticipated } }; // Adjust according to the structure of driveClosingDetails
    }
    if (totalPlaced) {
      filter.driveClosingDetails = { $elemMatch: { totalPlaced } }; // Adjust according to the structure of driveClosingDetails
    }

    // Fetch drives based on the filter
    const drives = await Drive.find(filter);

    // Respond with the filtered drives
    res.status(200).json(drives);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/drives/:id',authMiddleware, async (req, res) => {
  try {
    const drive = await Drive.findById(req.params.id);
    if (!drive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.status(200).json(drive);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/drives/:id',authMiddleware, async (req, res) => {
  try {
    const updatedDrive = await Drive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDrive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.status(200).json(updatedDrive);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/drives/:id',authMiddleware, async (req, res) => {
  try {
    const deletedDrive = await Drive.findByIdAndDelete(req.params.id);
    if (!deletedDrive) {
      return res.status(404).json({ message: 'Drive not found' });
    }
    res.status(200).json({ message: 'Drive deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    res.status(200).json(users);     // Send all user details
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;