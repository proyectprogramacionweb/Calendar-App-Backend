const { response } = require('express');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

const crearUsuario = async (req, res = response) => {

    const { email, password } = req.body;

    try {
        let usuario = await Usuario.findOne({ email });
        if (usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya existe con ese correo'
            });
        }

        usuario = new Usuario(req.body);

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        await usuario.save();


        //Generar JWT
        const token = await generarJWT(usuario.id, usuario.name)

        res.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

//--------------------------------------------------------//
const loginUsuario = async (req, res = response) => { // Añadido async

    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario no existe con ese correo'
            });
        }

        // Confirmar los passwords
        const validarPassword = bcrypt.compareSync(password, usuario.password); // Cambiado a compareSync para sincronía
        if (!validarPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Password Incorrecto'
            });
        }

         //Generar JWT
         const token = await generarJWT(usuario.id, usuario.name)


        res.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

//--------------------------------------------------------//
const revalidarToken = async (req, res = response) => {

    const {uid, name} = req;


    // Generar un nuevo JWT y retornarlo a esta peticion 
    const token = await generarJWT(uid, name)

    res.json({
        ok: true,
        uid, name,
        token
        
    });
}

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
}

