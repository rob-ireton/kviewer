# Kviewer 
This is work in progress project and active. The goal of this project is to create a little server + client to view some kubernetes time based metrics. You could ask, surely dump all the content into Prometheus and use Grafana. Well, yes and no. What if you have a small project and don't want to deploy that, or not yet. What if you are simply attching to a kube context and want a better view than CLI or what k9s offers (k9s is great btw). So simply, this is a way of seeing some time series data and possible other views on some of the more normally accessed artefacts. I've started with pods, deployments and will work on events.

## Plans
I can see this utility growing and becoming a non-fully-fledged k8s client. The focus and USP is really to view data, mainly time-series, to give a nice visual representation of the artefects. Its also a project to revise the skills of the technologies involved. I don't expect this to go viral and replace or be better than other offerings! However is may be useful for others to clone the repo as this will have a baseline to establish the general artefacts needed to create similar projects.

## Technology
One of the aims of this project was to have nice REACT view. As it turns out, HTML5 canvas worked out to be a nice way of generating a custom view. Overall, the technologies involved are
1. Typescript/ REACT and gradually use more AntD
2. Golang
3. Docker
4. NGINX for API gateway

Deployment of the server is either as a standalone server, within docker or in production in k8s.

## Testing

As this project is pretty new, there will be limited tests until a baseline foundation exists.
The server and client will need to bring in scaling as clearly the artefacts that will be queried will be potentially large record sets.

# API
The server API is being developed and will need to add querying capabililty to scale.

# Kuberenets
The server works with the golang kubectl client. Toyed with the idea of running kubectl in proxy mode but thought better to use the native go client version.
Deployment files and roles exist for the server.
Current kube context is used to access the cluster.
The in-cluster deployment is the prefered mode of operation for the server.

# Packaging and deployment
Currently there is a separate deployment for the server. The client has not been deployed inside k8s yet as I use KIND for my testing and haven't got around to deploying to public cloud and setting a Loadbalancer. Hence for now, there is a k8s port-forward required for server-to-client.
The plan is to deploy the client in k8s after building a client docker image. And then have an overall deployment for all containers to have an easy setup.
At this time I've not optimised the resource needs for any of the containers but they will be small and meant to be very light-weight. I'd like to be able to publish so that it's a simple install for folks to drop onto system, use and then delete as necessary. It's a utility project by nature to start off with.

# filtersvr
There is a sister project to provide a proxy server to filter some of the API requests with query params. This is really a NodJS playgound and not expected to last. I kept this in a separate repo to avoid confusion.

