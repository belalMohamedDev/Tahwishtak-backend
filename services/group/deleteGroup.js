const asyncHandler = require("express-async-handler");
const Group = require("../../modules/taskGroupSchema");
const Task = require("../../modules/taskSchema");

//  @desc   delete a task group
//  @route   DELETE /api/v1/taskGroups/:id
//  @access  Protected (user)
exports.deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userModel._id;

  const group = await Group.findById(id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (String(group.ownerId) !== String(userId))
    return res.status(403).json({ message: "Only owner can delete group" });

  await Group.deleteOne({ _id: id });

  await Task.deleteMany({ groupId: id });

  res.json({ success: true, message: "Group deleted" });
});
