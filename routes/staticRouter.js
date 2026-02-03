const { Router } = require("express");
const {
    handleGetHome,
    handleGetAbout,
    handleGetContact,
    handlePostContact,
    handlePostSubscribe,
    handleGetHealth
} = require("../controller/static");

const router = Router();

// Health Check
router.get('/health', handleGetHealth);

// Home Page
router.get('/', handleGetHome);


router.get('/about-us', handleGetAbout);

router.get('/contact', handleGetContact);


router.post('/contact', handlePostContact);

// Subscribe Route
router.post('/subscribe', handlePostSubscribe);



module.exports = router;