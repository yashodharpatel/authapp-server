import User from "#models/user";

const register = async (email, username) => {
  const user = await User.findOne({
    $or: [
      {
        email: email,
      },
      {
        username: username,
      },
    ],
  });

  if (user) {
    return true;
  } else {
    return false;
  }
};

const login = async (value) => {
  const user = await User.findOne({
    $or: [
      {
        email: value,
      },
      {
        username: value,
      },
    ],
  });

  if (user) {
    return user;
  } else {
    return -1;
  }
};

export default { register, login };
