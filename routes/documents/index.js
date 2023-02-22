const routes = require('express').Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const {Documents, DocSubType } = require('../../models');
const {docSubTypeAssociations} = require ('../../functions/associations/docSubTypeAssociation')

/*===========================Documents-Table===========================*/

routes.post("/CreateDocCreate", async(req, res)=>{
    try{
    const doc = await Documents.create({doc_type:req.body.doc_type})
    res.send(doc)
    }catch(e){
        res.json({message:'Error Occured'})
    }
})

/*===========================DocSubTypes-Table===========================*/

routes.post("/CreateDocSubTypes", async(req, res)=>{
    try{
    const doc = await DocSubType.create({
        mov_type:req.body.mov_type,
        title:req.body.title,
        DocumentId:req.body.doc_id
    })
    res.send(doc)
    }catch(e){
        res.json({message:'Error Occured'})
    }
})

routes.get("/GetDocSubTypes", async(req, res)=>{
    try{
    const doc = await DocSubType.findAll({
        where:{DocumentId:req.headers.doc_id}
    })
    res.json({status:'Success',doc})
    }catch(e){
        res.json({message:'Failed'})
    }
})

module.exports = routes;