import { v4 as uuidv4 } from 'uuid'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Moment from 'App/Models/Moment'
import Application from '@ioc:Adonis/Core/Application'

export default class MomentsController {

    private validationOptions = {
        types: ["image"],
        size: "2mb",
    }

    public async store({ request, response }: HttpContextContract) {

        const body = request.body()

        const image = request.file("image", this.validationOptions)

        if (image) {
            const imageName = `${uuidv4()}.${image.extname}`

            await image.move(Application.tmpPath("uploads"), {
                name: imageName
            })

            body.image = imageName
        }


        const moment = await Moment.create(body)

        response.status(201)

        return {
            menssage: "Momento criado",
            data: moment,
        }

    }

    public async index() {
        const moments = await Moment.query().preload("coments")

        return {
            data: moments,
        }
    }

    public async show({ params }: HttpContextContract) {
        const moment = await Moment.findOrFail(params.id)

        await moment.load("coments")

        return {
            data: moment,
        }
    }

    public async destroy({ params }: HttpContextContract) {
        const moments = await Moment.findOrFail(params.id)

        await moments.delete()

        return {
            message: "Momento excluido",
            data: moments,
        }
    }

    public async update({ params, request }: HttpContextContract) {

        const body = request.body()

        const moment = await Moment.findOrFail(params.id)

        moment.title = body.title
        moment.description = body.description

        if (moment.image != body.image || !moment.image) {

            const image = request.file("image", this.validationOptions)

            if (image) {

                const imageName = `${uuidv4()}.${image.extname}`  

                await image.move(Application.tmpPath("uploads"), {
                    name: imageName
                })

                moment.image = imageName
            }
        }
        await moment.save()

        return {
            message: "Momento atualizado",
            data: moment,
        }
    }

}
