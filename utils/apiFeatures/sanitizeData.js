exports.sanitizeUser = function (user, refreshToken) {
  // Check if 'user' is an array
  if (Array.isArray(user)) {
    return user.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      refreshToken: refreshToken,
    }));
  }

  // If 'user' is a single object
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    refreshToken: refreshToken,
  };
};
