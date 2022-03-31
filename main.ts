import { Construct } from 'constructs';
import { App, Chart, ChartProps, Duration, Size } from 'cdk8s'
import {  Deployment, ImagePullPolicy, PersistentVolumeAccessMode, PersistentVolumeClaim, Service, Volume, Probe, Resources, Cpu } from 'cdk8s-plus-22';
export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = {}) {
    super(scope, id, props);

    const deployment = new Deployment(this, 'drupal-deployments', {

    });

    const pvcClaim = new PersistentVolumeClaim(this, 'claim', {
      storage: Size.gibibytes(1),
      accessModes: [PersistentVolumeAccessMode.READ_WRITE_ONCE],
    });

    const storage = Volume.fromPersistentVolumeClaim(pvcClaim);

    // const init_container = new Container({
    //   name: 'init-sites-volume',
    //   image: 'drupal:8.6',
    //   command: ['/bin/bash', '-c'],
    //   args: ['cp -r /var/www/html/sites/ /data/; chown www-data:www-data /data/ -R'],
    // });

    const resources: Resources = {
      cpu: { request: Cpu.millis(250), limit: Cpu.millis(500) },
      memory: { request: Size.mebibytes(100), limit: Size.mebibytes(300) }
    }

    const readi = Probe.fromTcpSocket({
      failureThreshold: 1,
      initialDelaySeconds: Duration.seconds(5),
      periodSeconds: Duration.seconds(10),
      port: 80,
      successThreshold: 2,
      timeoutSeconds: Duration.seconds(60)
    });
    const liven = Probe.fromHttpGet("/healthz", {
      failureThreshold: 5,
      initialDelaySeconds: Duration.seconds(5),
      periodSeconds: Duration.seconds(10),
      port: 80,
      timeoutSeconds: Duration.seconds(60)
    });


    const container = deployment.addContainer({
      image: 'drupal:8.6',
      port: 80,
      imagePullPolicy: ImagePullPolicy.ALWAYS,
      name: "drupal",
      resources: resources,
      readiness: readi,
      liveness: liven,
      startup: Probe.fromHttpGet("/healthz", {
        failureThreshold: 30,
        periodSeconds: Duration.seconds(10)
      }),

    });


    container.mount('/var/www/html/profiles', storage, {
      subPath: 'profiles'
    });
    container.mount('/var/www/html/modules', storage, {
      subPath: 'modules'
    });
    container.mount('/var/www/html/sites', storage, {
      subPath: 'sites'
    });
    container.mount(' /var/www/html/themes', storage, {
      subPath: 'themes'
    });

   // deployment.addInitContainer(init_container);

    // init_container.mount('/data', storage, {
    //   subPath: 'data'
    // });



    // deployment.addVolume(storage);

    const drupal_service = new Service(this, "drupal-service", {
      metadata: { name: 'drupalservice' }
    });

    drupal_service.addDeployment(deployment);



  }
}



const app = new App();
app.synth();



//functionality 
//readinesss and probeness
//heath checks
//hpa
//VPA= vertical pod autoscaler
//cdk8s for group session




    // const commandProbes: CommandProbeOptions ={
    //   failureThreshold:3,
    //   initialDelaySeconds: Duration.seconds(10),
    //   periodSeconds: Duration.seconds(5),
    //   successThreshold: 2,
    //   timeoutSeconds: Duration.seconds(5)

    // }





