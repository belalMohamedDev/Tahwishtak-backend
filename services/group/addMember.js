const asyncHandler = require("express-async-handler");
const User = require("../../modules/taskSchema");
const Group = require("../../modules/taskGroupSchema");

//  @desc   add member by owner
//  @route   POST /api/v1/taskGroups/:id/members
//  @access  Protected (user)
exports.addMember = asyncHandler(async (req, res) => {
  const { id } = req.params; // group id
  const { userEmailToAdd } = req.body; // email of user to add
  const userId = req.userModel._id;

  const group = await Group.findById(id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (String(group.ownerId) !== String(userId))
    return res.status(403).json({ message: "Only owner can add members" });

  // verify user exists
  const userToAdd = await User.findOne({ email: userEmailToAdd });
  if (!userToAdd)
    return res.status(404).json({ message: "User to add not found" });

  const already = group.members.some(
    (m) => String(m) === String(userToAdd._id),
  );
  if (already)
    return res.status(400).json({ message: "User already a member" });

  group.members.push(userToAdd._id);
  await group.save();

  // TODO: create notification for userToAdd that they were invited
  res.json({
    status: true,
    message: "Member added successfully",
    data: group,
  });
});
