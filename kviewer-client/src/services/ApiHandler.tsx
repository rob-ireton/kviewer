
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
                console.log(data.result);
                httpResponse.data = data.result;
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

    // Channels
    async listPods() {
        const url = `/api/pods/`;
        return await this.getObject(url);
    }
}

export default ApiHandler;