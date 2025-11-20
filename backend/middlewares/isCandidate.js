// middlewares/isCandidate.js
const isCandidate = (req, res, next) => {
  if (req.user && req.user.role === "candidate") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Candidates only" });
  }
};

export default isCandidate;
