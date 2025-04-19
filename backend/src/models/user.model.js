import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


const userSchema = new mongoose.Schema({
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName : {
        type: String,
        required: true,
        trim: true
    },
    password : {
        type: String,
        required: [true, 'Password is required']
    },
    Address : {
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        }
    },
    refreshToken : {
        type: String
    },
    isVerified : {
        type: Boolean,
        default: false
    }, 
    otp : {
        type: String,
        default: ""
    },
    otpExpiresAt : {
        type: Date,
        default: Date.now
    },
    isKycVerified: {
        type: Boolean,
        default: false
    },
    privateKey:{
        type: String,
        default: ""
    },
    role:{
        type: String,
        enum: ['lender', 'borrower'],
        default: 'borrower'
    },
    walletAddress:{
        type: String,
        default: ""
    }
}
, {timestamps: true})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 8)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
    return token;
};

userSchema.methods.generateRefreshToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
    return token;
};

export const User = mongoose.model('User', userSchema)