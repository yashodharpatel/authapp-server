const validateEmail = (email, res) => {
  const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  if (!regEx.test(email)) {
    res.status(400);
    throw new Error("Please enter a valid email address");
  }
};

export default { validateEmail };
