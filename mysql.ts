import { App, Chart, Size } from "cdk8s";
import { Deployment, EnvValue, ImagePullPolicy, 
    PersistentVolumeAccessMode, PersistentVolumeClaim,
     Secret, Service, Volume  } from "cdk8s-plus-22";
import { MyChart } from './main'
export const app = new App();
const mychart = new Chart(app, 'mysql-chart');

const mysqlSecrets = new Secret(mychart,'mysqlSecrets',{
    metadata: { name: 'mysqlsecrets',},
    stringData: {
        'MYSQL_ROOT_PASSWORD': 'password',
        'MYSQL_DATABASE': 'drupal'
    }
});
mysqlSecrets.addStringData('password','tests');

const deployment = new Deployment(mychart,'mysqldeployment');

const containers = deployment.addContainer({
    image: 'mysql:5.7',
    port: 3306,
    imagePullPolicy: ImagePullPolicy.ALWAYS,
    name: 'mysql',
    
});

containers.addEnv('MYSQL_ROOT_PASSWORD',EnvValue.fromValue('password'));
containers.addEnv('MYSQL_DATABASE',EnvValue.fromValue('drupal'));

//env: {"MYSQL_ROOT_PASSWORD": EnvValue.fromSecretValue(mysqlSecrets.getStringData)}

const pvcClaims = new PersistentVolumeClaim(mychart,'mysqlclaim',{
  storage: Size.gibibytes(1),
  accessModes: [ PersistentVolumeAccessMode.READ_WRITE_ONCE]
});

// const storages = Volume.fromEmptyDir('mysqlstorage');
// containers.mount('/var/lib/mysql',storages);
containers.mount('/var/lib/mysql', Volume.fromPersistentVolumeClaim(pvcClaims));

const mysql_service = new Service(mychart,'mysql-service',{
    metadata: { name: 'mysqlservice'}
});
mysql_service.addDeployment(deployment);


//importing the Mychart to synth
new MyChart(app,'drupal');
app.synth();



