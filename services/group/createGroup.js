const asyncHandler = require("express-async-handler");
const User = require("../../modules/taskSchema");
const Group = require("../../modules/taskGroupSchema");

//  @desc   create a new task group
//  @route   POST /api/v1/taskGroups
//  @access  Protected (user)

exports.createGroup = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  const ownerId = req.userModel._id;

  // 1) extract emails
  let emails = Array.isArray(members) ? members.filter(Boolean) : [];

  // remove duplicates
  emails = [...new Set(emails)];

  // remove owner's email if included
  const owner = await User.findById(ownerId).select("email");
  emails = emails.filter((e) => e !== owner.email);

  // 2) fetch users by email
  const foundUsers = await User.find({ email: { $in: emails } }).select("_id");

  const memberIds = foundUsers.map((u) => u._id);

  // 3) create group
  const group = new Group({
    name,
    description,
    ownerId,
    members: memberIds,
  });

  await group.save();

  res.status(201).json({
    status: true,
    message: "Group created successfully",
    data: group,
  });
});




