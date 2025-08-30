import { Redirect } from 'expo-router';
import { buildIntegerEquations, buildNegativeIntegerEquations } from '@/content/math/equation-scheme';

console.log(buildNegativeIntegerEquations(5, 150, 5));

const Index = () => {
  return <Redirect href="/my-day" />;
};
export default Index;
