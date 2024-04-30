import { utilService } from "./util.service"

export const imageUploadService = {
    uploadMedia
}

async function uploadMedia(files) {
    // https://cloudinary.com/ip/gr-sea-gg-brand-home-base?utm_source=google&utm_medium=search&utm_campaign=goog_selfserve_brand_wk22_replicate_core_branded_keyword&utm_term=1329&campaignid=17601148700&adgroupid=141182782954&keyword=cloudinary&device=c&matchtype=e&adposition=&gad_source=1&gclid=Cj0KCQiAnrOtBhDIARIsAFsSe522_zlZuRT6xTHIS_fhlBG4mf4eA0Q3vjwyZ6L9DK6zBaidLeziRKsaAvKGEALw_wcB
    const fileName = files[0]
    const fileType = utilService.getMediaType(fileName.name)

    const CLOUD_NAME = "do5lkisxf"    // sashboard --> cloud name
    const UPLOAD_PRESET = "sksuk855"    // settings --> upload --> Upload presets --> Unsigned
    const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${fileType}/upload`

    try {
        const formData = new FormData()
        formData.append('upload_preset', UPLOAD_PRESET)
        formData.append('file', fileName)
        
        const res = await fetch(UPLOAD_URL, {
            method: 'POST',
            body: formData
        })
        
        const imgUrl = await res.json()
        return imgUrl
    } catch (err) {
        console.log("imgUrl error: " + JSON.stringify(err))
        console.error('Failed to upload', err)
        throw err
    }
}