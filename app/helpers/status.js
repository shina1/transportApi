
const successMessage = { status : 'success'};
const errMsg = { status: 'error'};

const status = {
    success: 200,
    error: 500,
    notfound: 404,
    unauthorized: 401,
    conflict: 409,
    created: 201,
    bad: 400,
    nocontent: 204,
  };

  const trip_statuses = {
    active: 1.00,
    cancelled: 2.00,
  };

  export {
    successMessage,
    errMsg,
    status,
    trip_statuses,
  };