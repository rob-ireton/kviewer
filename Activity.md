# Status
# Working items
[x]. Client working, basic outline of time line view. No real attention to the controls given at the moment. The timeline view had basic operation but will need further work to operate with different sizing for scaling on large numbers.
[x] Mouse interaction with tooltips on canvas
[x] Server working
[x] Deployment into a KIND server working
[x] NGINX proxy deployed, currently as deployed into my devvm
[x] End to end operation

## Work items to do
1. Add filtering to server requests and add query params to API
2. Add UI features to operate view with more control
3. Concentrate on UI layout of controls and formatting of a control-panel
4. Unit tests
5. Scale test
6. Enhance API for more content extracted from kubectl
7. Deployment of NGINX into k8s
8. Overall packaging for project for one-shot deployment and access client via loadbalancer (optional)

Generally, I'll tackle these as I see fit :).

I work on a Mac with all this driven by an ubuntu dev VM running on my mac which is has docker CE, KIND, K9s operating as basic platform. I use my MAC with VS code with remote attach with dev VM running normally headless. UI debug has been almost exclusively with Chrome on Mac.