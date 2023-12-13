import throwError from "#utilities/throwError";

const checkMandatory = (field, fieldName, res) => {
  if (!field) {
    throwError(res, 400, `${fieldName} cannot be blank`);
  }
};

export default checkMandatory;