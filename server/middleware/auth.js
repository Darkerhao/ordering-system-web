// 简单的权限校验中间件
// 用户信息通过请求头传递：x-user-id, x-user-role

function requireRole(...roles) {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
      return res.status(401).json({ error: '未登录，请先登录' });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: '权限不足，无法执行此操作' });
    }

    // 将用户信息挂到 req 上
    req.user = { id: Number(userId), role: userRole };
    next();
  };
}

module.exports = { requireRole };
