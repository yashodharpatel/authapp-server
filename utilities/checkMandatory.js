const checkMandatory = (field, fieldName, res) => {
  if (!field) {
    res.status(400);
    throw new Error(`${fieldName} cannot be blank`);
  }
};

export default checkMandatory;