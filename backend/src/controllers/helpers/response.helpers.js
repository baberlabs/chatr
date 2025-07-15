const userResponse = ({ _id, fullName, email, profilePic, isVerified }) => ({
  _id,
  fullName,
  email,
  profilePic,
  isVerified,
});

const chatResponse = ({
  _id,
  isGroup,
  participants,
  chatName,
  groupAdmin,
  latestMessage,
  createdAt,
  updatedAt,
}) => ({
  _id,
  isGroup,
  participants,
  chatName,
  groupAdmin,
  latestMessage,
  createdAt,
  updatedAt,
});

export { userResponse, chatResponse };
