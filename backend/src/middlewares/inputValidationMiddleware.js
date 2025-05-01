const { body, validationResult } = require("express-validator");

const validateProjectData = [
    body("projectName").not().isEmpty().withMessage("Project name is required"),
    body("domain").not().isEmpty().withMessage("Domain is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("referenceFile").optional().isURL().withMessage("Reference file URL is invalid"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = { validateProjectData };