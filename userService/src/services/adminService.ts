import { adminRepostiory } from "../repositories/adminRepository";


export class AdminService {

    private _adminRepository = new adminRepostiory()


    async saveBannerData(title: string, description: string, image: string) {

        const newBanner = await this._adminRepository.saveBanner({
            title,
            description,
            image
        })

        return newBanner
    }


    async getBanner(){
        const getbanner = await this._adminRepository.getbanner()
        return getbanner
    }

    async deleteBusingid(id:string){
        const banner = await this._adminRepository.deleteBanner(id)
        return banner
    }
    
}