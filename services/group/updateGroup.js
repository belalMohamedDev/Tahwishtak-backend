const asyncHandler = require("express-async-handler");
const Group = require("../../modules/taskGroupSchema");

//  @desc   update a task group
//  @route   PUT /api/v1/taskGroups/:id
//  @access  Protected (user)

exports.updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const userId = req.userModel._id;

  const group = await Group.findById(id);
  if (!group)
    return res.status(404).json({ status: false, message: "Group not found" });

  // only owner can update group basic info
  if (String(group.ownerId) !== String(userId))
    return res
      .status(403)
      .json({ status: false, message: "Only owner can update group" });
  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;

  await group.save();

  res.json({
    status: true,
    message: "Group updated successfully",
    data: group,
  });
});
