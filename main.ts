import { Construct } from 'constructs';
import { App, Chart, ChartProps, Size } from 'cdk8s';
import  { Container, Deployment, ImagePullPolicy, PersistentVolumeAccessMode, PersistentVolumeClaim, Service, Volume }  from 'cdk8s-plus-22';
export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

  const deployment= new Deployment(this,'drupal-deployments',{
  });

  const pvcClaim= new PersistentVolumeClaim(this,'claim',{
    storage: Size.gibibytes(1),
    accessModes: [PersistentVolumeAccessMode.READ_WRITE_ONCE],
  });
  
  const storage = Volume.fromPersistentVolumeClaim(pvcClaim);

  const init_container = new Container({
    image: 'drupal:8.6',
    command: [ '/bin/bash', '-c'],
    args: [ 'cp -r /var/www/html/sites/ /data/; chown www-data:www-data /data/ -R']
  });

    const container =  deployment.addContainer({
    image: 'drupal:8.6',
    port: 80,
    imagePullPolicy: ImagePullPolicy.ALWAYS,
    name: "drupal"
  });
 
  
  container.mount('/var/www/html/profiles',storage,{
    subPath: 'profiles'
  });
  container.mount('/var/www/html/modules', storage,{
    subPath:'modules'
  });
  container.mount('/var/www/html/sites',storage,{
    subPath: 'sites'
  });
  container.mount(' /var/www/html/themes',storage,{
    subPath: 'themes'
  });


  // deployment.addInitContainer(init_container);

  init_container.mount('/data', storage,{
    subPath: 'data'
  });

  // deployment.addVolume(storage);

const drupal_service = new Service(this,"drupal-service",{
  metadata: { name: 'drupalservice'}
});

drupal_service.addDeployment(deployment);
  }
}

const app = new App();
app.synth();
