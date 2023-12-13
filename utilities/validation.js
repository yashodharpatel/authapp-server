import throwError from "#utilities/throwError";

const validateEmail = (email, res) => {
  const regEx = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  if (!regEx.test(email)) {
    throwError(res, 400, "Please enter a valid email address");
  }
};

export default { validateEmail };
