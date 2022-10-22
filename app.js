const express = require("express");
const { JsonWebTokenError } = require("jsonwebtoken");
const app = express();
const bodyParser = require("body-parser");
const { User,Login }  = require("./models")
const { Op}  = require("sequelize");
const jwt = require("jsonwebtoken");
app.use(bodyParser.json());
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } ));
const bcrypt = require('bcrypt');
const authMiddlewares = require("./middlewares/auth-middlewares");
const salt = 12;
//소금 뿌리기

// app.set('view engine', 'ejs');
app.set('views', './views');
app.get('/',(req,res)=>{
    res.render('lotest.ejs');
})


app.post('/sign',async (req,res)=>{
    let {useId , password} = req.body;
    //비밀번호 소금뿌려서 해쉬화 하기.
    const hash = bcrypt.hashSync(password, salt);
    let user = await User.findAll({
        where: {
           [Op.or]: [{useId:useId}],
        }
    })
    if(user.length !== 0){
        return res.json({res:"이미 존재하는 아이디입니다."})
    }
    await User.create({
        useId : useId,
        password : hash
    })
    return res.json({res:"회원가입완료"})
})

//로그인 하면서 토큰을 발급해주고 리프레쉬 토큰은 디비에 저장하도록 하는 함수
app.post('/login', async (req,res)=>{
    let {useId , password} = req.body;
    //회원 있는지 확인
    let user = await User.findAll({
        where: {
           [Op.or]: [{useId:useId}],
        }
        
});
if(user.length === 0){
    return res.json({data:"회원가입하세여"})
}
// 저장된 해쉬 비밀번호를 꺼내서 아래에서 비교를 해서 true false를 리턴해준다.
const match = bcrypt.compareSync(password, user[0].dataValues.password);
  console.log(match)
    
    if(!match){
        return res.json({data:"비밀번호가 틀렸습니다."})
    }
    const token = jwt.sign({user : req.body.useId},"이것은쩌렁",{expiresIn:"30m"})
    const refresh = jwt.sign({},"이것은쩌렁",{expiresIn:"7d"}) 
    
    
    
    await Login.create({
        useId : useId,
        refresh:refresh
    })
    res.json({data : token})
})

app.post('/logout', async(req,res)=>{
    let {token} = req.body; 
    try{
    const decoded = jwt.decode(token);
    await Login.destroy({

            where : {
             useId : decoded.user
        }

   })
    res.send("로그아웃")
}catch(err){
  return res.json({data:"로그인이 되어있지 않습니다."})
}
})

app.get('/auth',authMiddlewares,async(req,res)=>{
    console.log(res.locals.user)
    
})

app.get('/main', async(req,res)=>{
    res.render('move.ejs')
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})
