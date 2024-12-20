module.exports = (srv) => {
  const { Users } = srv.entities;

  srv.before("CREATE", Users, async (req) => {
    const { email, BusinessPartnerID } = req.data;
    const emailExists = await srv.run(SELECT.one.from(Users).where({ email }));
    if (emailExists) {
      req.error(400, `El correo electrónico '${email}' ya está registrado.`);
    }

    if (!BusinessPartnerID) {
      req.error(400, "El campo BusinessPartnerID es obligatorio.");
    }

    try {
      const BusinessPartnerService = await cds.connect.to(
        "API_BUSINESS_PARTNER"
      );

      const result = await BusinessPartnerService.run(
        SELECT.one
          .from("A_BusinessPartner")
          .where({ BusinessPartner: BusinessPartnerID })
      );

      if (!result) {
        req.error(
          404,
          `El BusinessPartnerID '${BusinessPartnerID}' no existe en el sistema de Business Partner.`
        );
      }
    } catch (error) {
      console.error("Error al validar BusinessPartnerID:", error.message);
      req.error(
        500,
        "No se pudo validar el BusinessPartnerID. Verifique la conexión al servicio externo."
      );
    }
  });

  srv.on("fetchUserDetails", async (req) => {
    const { email } = req.data;

    if (!email) {
      req.error(400, "Email is required.");
    }

    try {
      // Buscar el usuario en la tabla interna de Users por email.
      const user = await srv.run(SELECT.one.from("Users").where({ email }));

      if (!user) {
        req.error(404, `User with email '${email}' not found in the system.`);
      }

      const { BusinessPartnerID } = user;

      if (!BusinessPartnerID) {
        req.error(
          400,
          `User with email '${email}' does not have an associated BusinessPartnerID.`
        );
      }

      // Conectar al servicio externo API_BUSINESS_PARTNER.
      const bupa = await cds.connect.to("API_BUSINESS_PARTNER");

      // Consultar el servicio externo para obtener detalles del Business Partner.
      const result = await bupa.run(
        SELECT.one
          .from("A_BusinessPartner") // Consulta a la API remota
          .where({ BusinessPartner: BusinessPartnerID })
      );

      if (!result) {
        req.error(
          404,
          `Business Partner with ID '${BusinessPartnerID}' not found in the external system.`
        );
      }

      // Retornar los detalles del Business Partner.
      return result;
    } catch (error) {
      console.error("Error fetching Business Partner details:", error);
      req.error(500, "Failed to fetch Business Partner details.");
    }
  });
};
