const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')

const {getAssignments,postAssignment, getAssignment, deleteAssignment, putAssignment, patchAssignments, postSubmission } = require('../controllers/assignmentControllers');


//get all the available assignments
router.get('/',auth, getAssignments);


//get a particular assignment
router.get('/:id',auth, getAssignment);

 //adding a new assignmnent
 router.post('/',auth, postAssignment);

// //update an assignment
router.put('/:id', auth, putAssignment);

// //delete a todo task from the database 
router.delete('/:id', auth, deleteAssignment );

// update only - patch 
router.patch('/:id', auth, patchAssignments );

router.post('/:id/submission', auth, postSubmission);


module.exports = router;