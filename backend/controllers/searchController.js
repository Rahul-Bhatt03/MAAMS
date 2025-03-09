import User from '../models/userModel.js'


// * @param {Object} req - The request object.
//  * @param {Object} res - The response object.

export const searchDatabase=async (req,res)=>{
    const {query,page=1,limit=10}=req.query;  //pagination parameters

    try{
        //search users
        const users=await User.find({
$or:[
    {name:{$regex:query,$options:'1'}} , //case-sensitive search
    {email:{$regex:query,$options:'1'}},
],
        }).select('name email role')
        .skip((page-1)*limit)
        .limit(limit)

        //search departments
const departments=await Departments.find({
    name:{$regex:query,$options:'1'}
}).select('name description')
.skip((page-1)*limit)
.limit(limit)

//combine results
const results={
    users,departments
}

res.status(200).json(results)
    }catch(error){
        res.status(500).json({message:'search failed',error:error.message})
    }

}
 