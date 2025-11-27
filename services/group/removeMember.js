const asyncHandler = require("express-async-handler");
const Group = require("../../modules/taskGroupSchema");

//  @desc   remove member by owner
//  @route   DELETE /api/v1/taskGroups/:id/members
//  @access  Protected (user)
exports.removeMember = asyncHandler(async (req, res) => {
  const { id } = req.params; // group id
  const { userIdToRemove } = req.body;
  const userId = req.user._id;

  const group = await Group.findById(id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  // only owner can remove members
  if (String(group.ownerId) !== String(userId))
    return res.status(403).json({ message: "Only owner can remove members" });

  group.members = group.members.filter(
    (m) => String(m) !== String(userIdToRemove),
  );
  await group.save();

  // TODO: notify removed user if desired
  res.json({
    status: true,
    message: "Member removed successfully",
    data: group,
  });
});
