
interface ApiResponse extends Response{
    data?: string;
}
class ApiHandler {
    async baseFetch(path: string, { method = 'GET', body = undefined, setContentType = true }) {
        let httpResponse: ApiResponse = {} as ApiResponse;
        try {
            let headers: HeadersInit = new Headers();
            if (method !== 'GET' && setContentType){
                headers.set('Content-Type','application/json');
            }

            httpResponse = await fetch(path, {
                method,
                headers,
                body,
            });
            
            try {
                let data = await httpResponse.json();
                if (data.error === "ok"){
                    httpResponse.data = data.result;
                } else {
                    console.log("Error in API response");
                    httpResponse.data = "";
                }
            } catch (ex) {
                console.log(ex);
            }
        } catch (ex) {
            console.log(ex);
        }

        return httpResponse;
    }

    async getObject(path: string) {
        return await this.baseFetch(path, {});
    }

    // Pods
    async listPods() {
        const url = `/api/pods/`;
        return await this.getObject(url);
    }

    // Events
    async listCurrentEvents() {
        const url = `/api/events/`;
        return await this.getObject(url);
    }
    
    // Deployments
    async listDeployments() {
        const url = `/api/deployments/`;
        return await this.getObject(url);
    }
}

export default ApiHandler;