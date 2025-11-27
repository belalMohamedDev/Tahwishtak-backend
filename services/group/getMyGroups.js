const asyncHandler = require("express-async-handler");
const Group = require("../../modules/taskGroupSchema");

//  @desc   get all groups of the logged-in user
//  @route   GET /api/v1/taskGroups
//  @access  Protected (user)

exports.getMyGroups = asyncHandler(async (req, res) => {
  const userId = req.userModel._id;
  // groups where user is owner or member
  const groups = await Group.find({
    $or: [{ ownerId: userId }, { members: userId }],
  })
    .populate("ownerId", "name email")
    .populate("members", "name email");

  res.json({
    status: true,
    message: "Groups fetched successfully",
    data: groups,
  });
});
