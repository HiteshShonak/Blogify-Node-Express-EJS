const { Router } = require("express");
const { restrictTo } = require("../middlewares/auth");
const {
  handleGetSignup,
  handleGetLogin,
  handleGetGetStarted,
  handlePostSignup,
  handlePostLogin,
  handleGetLogout,
  handleGetProfile
} = require("../controller/user");

const router = Router();

router.get("/signup", restrictTo(['GUEST']), handleGetSignup);
router.get("/login", restrictTo(['GUEST']), handleGetLogin);

router.get('/get-started', handleGetGetStarted);

router.post("/signup", handlePostSignup);

router.post("/login", handlePostLogin);

router.get("/logout", restrictTo(['USER', 'ADMIN']), handleGetLogout);


router.get('/profile', restrictTo(["USER", "ADMIN"]), handleGetProfile);

module.exports = router;