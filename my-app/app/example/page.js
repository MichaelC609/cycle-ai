import PageLayout from '../components/PageLayout';

export default function ExamplePage() {
  return (
    <PageLayout>
      <div>
        <h1>Example Page</h1>
        <p>This is an example of how to use the PageLayout component with the navbar on any page.</p>
        <p>The navbar will automatically highlight the correct navigation item based on the current route.</p>
      </div>
    </PageLayout>
  );
}