module.exports = (srv) => {
    const { Users } = srv.entities;
    
    srv.before('CREATE', Users, async (req) => {
        const { Email } = req.data;
        const emailExists = await srv.run(SELECT.one.from(Users).where({ Email }));
        if (emailExists) {
            req.error(400, `El correo electrónico '${Email}' ya está registrado.`);
        }
    });

};