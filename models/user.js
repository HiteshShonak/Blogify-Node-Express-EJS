const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageURL: {
    type: String,
    default: '/images/default.webp',
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
}, { timestamps: true });

userSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;

  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  user.password = hashedPassword;
  
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("user", userSchema);

module.exports = User;