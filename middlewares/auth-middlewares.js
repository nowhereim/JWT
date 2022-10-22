const jwt = require("jsonwebtoken");
const { User, CommenT, PosT, likekey } = require("../models");
const { Op } = require("sequelize");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const [tokenType, tokenValue] = String(authorization).split(" ");
  if (tokenType !== "Bearer") {
    res.send("뭔가 이상해요");
  }

  //만약 유효성 검사를 통과하지 못하면 해당 아이디의 db로 가서 리프레쉬 토큰을 db에서 찾아서
  // 만약에 있으면 꺼내서 유효성 검사를 하고
  //엑세스 토큰을 만들어서 보내주고 아니면 로그인페이지로 보내주는거지
  //그리고 엑세스 토큰 만료시간은 1시간으로 하고 리프레쉬 토큰 만료시간은 7일로 하면 될거같아
  //대신 로그아웃 할때는 로컬 스토리지의 토큰을 지워주고 db의 리프레쉬 토큰도 지워주면 될거같아
  try {
    console.log(tokenValue);
    const { user } = jwt.verify(tokenValue, "이것은쩌렁");

    let x = await User.findAll({
      where: {
        [Op.or]: [{ useId: user }],
      },
    });
    res.locals.user = x[0].dataValues.useId;
    console.log(res.locals.user);
    // throw new Error("여기까지 정상적으로 온다.");
    // console.log(res.locals.user)
    res.send("인증완료");
    next();
  } catch (error) {
    res.send(error.name + "=" + error.massge);
    return;
  } finally {
    // next()
  }
};
// 미들웨어는 넥스트가 호출되어야 다음으로 넘거단다.
// 포론트에서 http header를 Authorization : bearer JWT토큰내용 으로 보내고 있따.

// const jwt = require('jsonwebtoken');
// const { User,CommenT,PosT,likekey } = require("../models");

// module.exports = async (req, res, next) => {

//     const { authorization } = req.headers;
//     console.log(authorization.split(' '))
//     // console.log(authorization)
//     const [tokenType, tokenValue] = authorization.split(' ');
//     console.log(`토큰 타입은 ===${tokenType},토큰 벨류는 ===${tokenValue}`)
//     next();
// // 토큰 타입을 검사한다.
// if(tokenType !== 'Bearer'){
// res.status(401).send({
// errorMessage: '로그인 후 사용하세요.'
// })
// return;
// }

// try {
// const {userId} = jwt.verify(tokenValue, 'this이즈super개쩌는token'); // userId가 없으면 오류가 나기 때문에 catch로 넘어가게 된다.
// User.findOne({userId}).then((user) => { // 위 코드에서 오류가 나게 되면 아래 코드는 안타기 때문에, 아래에서 userId를 DB에서 조회할 때 무조건 있다는 가정하에 코드를 작성한다.
// res.locals.user = user;
// next();
// })
// } catch (error) {
// res.status(401).send({
// errorMessage: '로그인 후 사용하세요.'
// });
// return;
// }
// }
