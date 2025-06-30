require('dotenv').config(); // Load environment variables from .env file

const mongoose = require('mongoose');

// Ensure the environment variable is set and provide a fallback or handle errors
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined in the .env file');
  process.exit(1); // Exit the process with an error code
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to Database'))
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
  process.exit(1); // Exit the process with an error code
});


const driveSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 50
    },
    hrDetails: {
        type: Array,
        minLength: 6
    },
    coodName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    status:{
         type:Number,
         required:true,
     },
     dateCreated:{
        type:String
     },
     dateUpdated:{
        type:String
     },
     driveDetails:{
         type:[
            {
                message:{
                    type:String,
                },
                reminder:{
                    date:{
                        type:Date,
                    },
                    reminderMessage:{
                        type:String
                    }
                }
            }
         ]
     },
     driveClosingDetails:{
        type:[
            {
                closingMessage:{
                    type:String,
                },
                closingStatus:{
                    type:Number,
                },
                closingDetails:{
                    type:[
                        {
                            totalParticipated:{
                                type:Number,
                            },
                            totalPlaced:{
                                type:Number,
                            },
                            linksToDocs:{
                                type:Array,
                            }
                        }
                    ]
                },

            }
        ]
    }
},{
    collection:'drives' // Specify the collection name here
});


const Drive = mongoose.model('Drive',driveSchema);

module.exports={
    Drive
};